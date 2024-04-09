package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
)

// Response structure to send back to the client
type UploadResponse struct {
	Result string `json:"result"`
	Size   int64  `json:"size"`
}

// uploadFileHandler handles the file upload and responds with the result and file size
func uploadFileHandler(w http.ResponseWriter, r *http.Request) {
	// Limit the size of the incoming file
	r.ParseMultipartForm(10 << 20) // 10 MB

	// Retrieve the file from the form data
	file, _, err := r.FormFile("uploadFile")
	if err != nil {
		fmt.Println("Error Retrieving the File")
		fmt.Println(err)
		return
	}
	defer file.Close()

	// Seek to the end of the file to get its size
	size, err := file.Seek(0, io.SeekEnd)
	if err != nil {
		response := UploadResponse{
			Result: "Error calculating file size",
			Size:   0,
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	// Optionally, seek back to the beginning of the file if you need to read it later
	_, err = file.Seek(0, io.SeekStart)
	if err != nil {
		// Handle the error
	}

	// Respond with the file size
	response := UploadResponse{
		Result: "OK",
		Size:   size,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func main() {
	http.HandleFunc("/upload", uploadFileHandler)

	// Start the server on port 8080
	log.Fatal(http.ListenAndServe(":8080", nil))
}
