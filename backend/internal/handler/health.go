package handler

import (
	"net/http"
)

func Health(w http.ResponseWriter, r *http.Request) {
	// Set status code to 200 OK
	w.WriteHeader(http.StatusOK)

	// Ignore error for now
	_, _ = w.Write([]byte("ok"))
}
