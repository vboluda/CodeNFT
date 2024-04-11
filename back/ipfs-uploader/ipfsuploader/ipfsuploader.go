package ipfsuploader

import (
	"strings"
	"os"
	"bytes"
    "mime/multipart"
    "net/http"
)

// ToUpper convierte un string a mayúsculas y lo retorna
func ToUpper(input string) string {
	return strings.ToUpper(input)
}


func UploadFileToPinata(file multipart.File, filename string) (string, error) {
    // Prepare the file for uploading
    var requestBody bytes.Buffer
    multipartWriter := multipart.NewWriter(&requestBody)
    fileWriter, err := multipartWriter.CreateFormFile("file", filename)
    if err != nil {
        return "", err
    }

    // Copy the file content into the multipart writer
    _, err = io.Copy(fileWriter, file)
    if err != nil {
        return "", err
    }
    multipartWriter.Close()

    // Create a new request to Pinata's pinning endpoint
    req, err := http.NewRequest("POST", pinataBaseURL+"/pinning/pinFileToIPFS", &requestBody)
    if err != nil {
        return "", err
    }

    // Set the necessary headers
    req.Header.Set("Content-Type", multipartWriter.FormDataContentType())
    req.Header.Set("pinata_api_key", apiKey)
    req.Header.Set("pinata_secret_api_key", apiSecret)

    // Perform the request
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return "", err
    }
    defer resp.Body.Close()

    // Process the response
    // You'll need to parse the response from Pinata to retrieve the IPFS hash or any relevant data
    // This is just a placeholder for the response processing
    var responseString string
    // Assume we have a function that processes the response and returns the IPFS hash as a string
    responseString, err = processResponse(resp)
    if err != nil {
        return "", err
    }

    return responseString, nil
}