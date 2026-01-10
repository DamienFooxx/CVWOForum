package auth

import (
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte(os.Getenv("JWT_SECRET"))

type contextKey string

const UserIDKey contextKey = "user_id"

type Claims struct {
	UserID int64 `json:"user_id"`
	jwt.RegisteredClaims
}

// GenerateToken creates the JWT Token for the User for that userid
func GenerateToken(userID int64) (string, error) {
	// Reload secret
	if len(jwtSecret) == 0 {
		jwtSecret = []byte(os.Getenv("JWT_SECRET"))
	}
	// If after reload it still does not exist, return error
	if len(jwtSecret) == 0 {
		return "", errors.New("JWT_SECRET is not set")
	}

	// Token valid for 24 hours after user login
	expirationTime := time.Now().Add(24 * time.Hour)

	claims := &Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime), // Set expiry so it cannot be reused indefinitely
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	// Construct the token using SHA256 algorithm
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// ValidateToken validates the JWT Token, then returns UserID for encapsulation
func ValidateToken(tokenString string) (int64, error) {
	// Reload secret
	if len(jwtSecret) == 0 {
		jwtSecret = []byte(os.Getenv("JWT_SECRET"))
	}

	// Create struct to store payload info from tokenString
	claims := &Claims{}

	// Validates Token
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok { // Check if token was signed using HMAC for security
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtSecret, nil
	})

	// Likely when token has expired
	if err != nil {
		return 0, err
	}

	if !token.Valid {
		return 0, errors.New("invalid token")
	}

	return claims.UserID, nil
}
