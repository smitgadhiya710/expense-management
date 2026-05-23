package database

import (
	"context"
	"crypto/tls"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const UsersCollection = "users"

func Connect(ctx context.Context, uri string) (*mongo.Client, error) {
	clientOptions := options.Client().
		ApplyURI(uri).
		SetConnectTimeout(30 * time.Second).
		SetServerSelectionTimeout(30 * time.Second).
		SetDirect(false).
		SetTLSConfig(&tls.Config{
			MinVersion: tls.VersionTLS12,
		})

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, err
	}

	if err := client.Ping(ctx, nil); err != nil {
		_ = client.Disconnect(ctx)
		return nil, err
	}

	return client, nil
}

func EnsureIndexes(ctx context.Context, db *mongo.Database) error {
	users := db.Collection(UsersCollection)
	indexes := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "email", Value: 1}},
			Options: options.Index().SetUnique(true).SetName("unique_email"),
		},
		{
			Keys:    bson.D{{Key: "phone", Value: 1}},
			Options: options.Index().SetUnique(true).SetName("unique_phone"),
		},
		{
			Keys:    bson.D{{Key: "userName", Value: 1}},
			Options: options.Index().SetUnique(true).SetName("unique_user_name"),
		},
	}

	_, err := users.Indexes().CreateMany(ctx, indexes)
	return err
}
