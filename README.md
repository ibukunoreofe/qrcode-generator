QR Code Generator App - README body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4; } h1 { color: #333; } h2 { color: #555; } pre { background-color: #eee; padding: 10px; border-left: 5px solid #ccc; overflow-x: auto; } code { background-color: #f9f9f9; padding: 2px 4px; font-size: 90%; color: #c7254e; border-radius: 4px; } ul, ol { margin: 10px 0; padding-left: 20px; } .code-block { background-color: #f1f1f1; border: 1px solid #ddd; padding: 10px; border-radius: 4px; white-space: pre; }

# QR Code Generator App - README

This is a scalable QR Code Generator API that allows users to generate QR codes, store them in a specified MinIO bucket, and view logs related to the QR code generation process.

## Key Features

*   Generate QR codes with customizable content, format, and size.
*   Store generated QR codes in a MinIO bucket.
*   View logs for QR code generation, including file name, creation time, and file size.
*   Scalable to multiple containers with unique log file naming to avoid conflicts.

## How to Run the Application

1.  **Install dependencies**:

    ```
    npm install
    ```

2.  **Set up environment variables**:

    Create a `.env` file in the root directory and specify the following:

    LOG\_USERNAME=admin  
    LOG\_PASSWORD=supersecret  
    AWS\_ACCESS\_KEY\_ID=your-access-key  
    AWS\_SECRET\_ACCESS\_KEY=your-secret-key  
    AWS\_REGION=your-region  
    MINIO\_ENDPOINT=your-minio-endpoint  
    MINIO\_ACCESS\_KEY=your-minio-access-key  
    MINIO\_SECRET\_KEY=your-minio-secret-key

3.  **Build and run the application**:

    ```
    npm start
    ```


## API Endpoints

### 1\. Generate QR Code

Endpoint: `/qr-code/generate`

**Method:** POST

**Description:** Generates a QR code and stores it in the MinIO bucket. The content, format, and size of the QR code are configurable via the request body.

Request Body Example:
{
"text": "https://example.com",
"format": "png",
"pixel": 300
}

### 2\. View Logs

Endpoint: `/logs`

**Method:** GET

**Description:** Displays a list of log files that show QR code generation logs, including file name, creation time, and file size.

**Note:** The logs endpoint is protected by basic authentication. Use the credentials provided in the `.env` file to access it.

## Accessing Logs

To access the logs, visit `/logs` in your browser. The logs are displayed in a table with clickable links for each log file, showing the creation time and file size in a human-readable format.

## Scaling the Application

The application is designed to run in a multi-container environment. Each container writes its logs to a unique file using a combination of a UUID and timestamp to avoid conflicts. All containers write to a shared directory or storage solution (such as NFS or EFS in Kubernetes).

## Security

*   Logs are protected by basic authentication using credentials from the `.env` file.
*   Environment variables are used for sensitive information such as MinIO and AWS credentials.

## Dependencies

*   **Express:** Web framework for handling API requests.
*   **Winston:** Logging library with support for daily file rotation.
*   **Winston-Daily-Rotate-File:** Rotates log files daily and handles multiple log files efficiently.
*   **Sharp:** Used for processing images (QR codes) and adding a logo to the QR code.
*   **MinIO:** Object storage solution where QR codes are stored.

## Running on Docker

```shell
docker-compose up -d

docker-compose ps -q | grep . && docker-compose down && docker-compose up --build


```


## License

This project is licensed under the MIT [License](LICENSE).
