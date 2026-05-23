package config

import (
	"os"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	AppEnv        string
	Port          string
	MongoURI      string
	MongoDatabase string
	JWTSecret     string
	JWTExpiresIn  time.Duration
}

func Load() Config {
	_ = godotenv.Load()

	return Config{
		AppEnv:        getEnv("APP_ENV", "development"),
		Port:          getEnv("PORT", "8080"),
		MongoURI:      getEnv("MONGO_URI", "mongodb://localhost:27017"),
		MongoDatabase: getEnv("MONGO_DATABASE", "expense_management"),
		JWTSecret:     getEnv("JWT_SECRET", "change-me-in-env"),
		JWTExpiresIn:  getDurationEnv("JWT_EXPIRES_IN", 24*time.Hour),
	}
}

func getEnv(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}

func getDurationEnv(key string, fallback time.Duration) time.Duration {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	duration, err := time.ParseDuration(value)
	if err != nil {
		return fallback
	}
	return duration
}
