#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <Adafruit_Fingerprint.h>
#include <SoftwareSerial.h>
#include <ArduinoJson.h>

//replace this with your wifi credentials
const char* ssid = "jasmitR";
const char* password = "12345678";

#if (defined(ESP8266)) && !defined(__AVR_ATmega2560_)
SoftwareSerial mySerial(14, 12);  // Define software serial pins for NodeMCU
#else
#define mySerial Serial1
#endif

Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);
ESP8266WebServer server(80);

void setup() {
  Serial.begin(115200);
  delay(10);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
  Serial.println(WiFi.localIP());


  // Initialize fingerprint sensor
  finger.begin(57600);
  delay(5);
  if (finger.verifyPassword()) {
    Serial.println("Found fingerprint sensor!");
  } else {
    Serial.println("Did not find fingerprint sensor :(");
    while (1) { delay(1); }
  }

  // Set up HTTP routes
  server.on("/", HTTP_GET, handleRoot);
  server.on("/enroll", HTTP_GET, handleEnroll);
  server.on("/verify", HTTP_GET, handleVerify);

  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  server.handleClient();
}

void handleRoot() {
  server.send(200, "text/plain", "Hello, NodeMCU!");
}

void handleEnroll() {
  String idStr = server.arg("id");
  if (idStr != "") {
    int id = idStr.toInt();
    int result = enrollFingerprint(id);
    if (result == 0) {
      server.send(200, "application/json", "{\"status\":\"Enrolled\",\"id\":" + idStr + "}");
    } else {
      server.send(200, "application/json", "{\"status\":\"EnrollmentFailed\",\"id\":" + idStr + "}");
    }
  } else {
    server.send(400, "application/json", "{\"error\":\"Invalid parameters\"}");
  }
}

void handleVerify() {
  String idStr = server.arg("id");
  if (idStr != "") {
    int id = idStr.toInt();
    int result = verifyFingerprint(id);
    if (result == 1) {
      server.send(200, "application/json", "{\"status\":\"Match\",\"id\":" + idStr + "}");
    } else if (result == 0) {
      server.send(200, "application/json", "{\"status\":\"NoMatch\",\"id\":" + idStr + "}");
    } else {
      server.send(200, "application/json", "{\"status\":\"VerificationFailed\",\"id\":" + idStr + "}");
    }
  } else {
    server.send(400, "application/json", "{\"error\":\"Invalid parameters\"}");
  }
}

int enrollFingerprint(int id) {
  int p = -1;
  Serial.print("Waiting for valid finger to enroll as #"); Serial.println(id);
  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
    switch (p) {
      case FINGERPRINT_OK:
        Serial.println("Image taken");
        break;
      case FINGERPRINT_NOFINGER:
        Serial.println(".");
        break;
      case FINGERPRINT_PACKETRECIEVEERR:
        Serial.println("Communication error");
        return -1;
      case FINGERPRINT_IMAGEFAIL:
        Serial.println("Imaging error");
        return -1;
      default:
        Serial.println("Unknown error");
        return -1;
    }
  }

  p = finger.image2Tz(1);
  switch (p) {
    case FINGERPRINT_OK:
      Serial.println("Image converted");
      break;
    case FINGERPRINT_IMAGEMESS:
      Serial.println("Image too messy");
      return -1;
    case FINGERPRINT_PACKETRECIEVEERR:
      Serial.println("Communication error");
      return -1;
    case FINGERPRINT_FEATUREFAIL:
      Serial.println("Could not find fingerprint features");
      return -1;
    case FINGERPRINT_INVALIDIMAGE:
      Serial.println("Could not find fingerprint features");
      return -1;
    default:
      Serial.println("Unknown error");
      return -1;
  }

  Serial.println("Remove finger");
  delay(2000);
  p = 0;
  while (p != FINGERPRINT_NOFINGER) {
    p = finger.getImage();
  }
  Serial.print("ID "); Serial.println(id);
  p = -1;
  Serial.println("Place the same finger again");
  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
    switch (p) {
      case FINGERPRINT_OK:
        Serial.println("Image taken");
        break;
      case FINGERPRINT_NOFINGER:
        Serial.print(".");
        break;
      case FINGERPRINT_PACKETRECIEVEERR:
        Serial.println("Communication error");
        return -1;
      case FINGERPRINT_IMAGEFAIL:
        Serial.println("Imaging error");
        return -1;
      default:
        Serial.println("Unknown error");
        return -1;
    }
  }

  p = finger.image2Tz(2);
  switch (p) {
    case FINGERPRINT_OK:
      Serial.println("Image converted");
      break;
    case FINGERPRINT_IMAGEMESS:
      Serial.println("Image too messy");
      return -1;
    case FINGERPRINT_PACKETRECIEVEERR:
      Serial.println("Communication error");
      return -1;
    case FINGERPRINT_FEATUREFAIL:
      Serial.println("Could not find fingerprint features");
      return -1;
    case FINGERPRINT_INVALIDIMAGE:
      Serial.println("Could not find fingerprint features");
      return -1;
    default:
      Serial.println("Unknown error");
      return -1;
  }

  p = finger.createModel();
  if (p == FINGERPRINT_OK) {
    Serial.println("Prints matched!");
  } else if (p == FINGERPRINT_PACKETRECIEVEERR) {
    Serial.println("Communication error");
    return -1;
  } else if (p == FINGERPRINT_ENROLLMISMATCH) {
    Serial.println("Fingerprints did not match");
    return -1;
  } else {
    Serial.println("Unknown error");
    return -1;
  }

  p = finger.storeModel(id);
  if (p == FINGERPRINT_OK) {
    Serial.println("Stored!");
    return 0; // Success
  } else if (p == FINGERPRINT_PACKETRECIEVEERR) {
    Serial.println("Communication error");
    return -1;
  } else if (p == FINGERPRINT_BADLOCATION) {
    Serial.println("Could not store in that location");
    return -1;
  } else if (p == FINGERPRINT_FLASHERR) {
    Serial.println("Error writing to flash");
    return -1;
  } else {
    Serial.println("Unknown error");
    return -1;
  }
}

int verifyFingerprint(int id) {
  int p = -1;
  Serial.print("Waiting for valid finger...");
  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
    switch (p) {
      case FINGERPRINT_OK:
        Serial.println("Image taken");
        break;
      case FINGERPRINT_NOFINGER:
        Serial.println(".");
        break;
      case FINGERPRINT_PACKETRECIEVEERR:
        Serial.println("Communication error");
        return -1;
      case FINGERPRINT_IMAGEFAIL:
        Serial.println("Imaging error");
        return -1;
      default:
        Serial.println("Unknown error");
        return -1;
    }
  }

  p = finger.image2Tz();
  switch (p) {
    case FINGERPRINT_OK:
      Serial.println("Image converted");
      break;
    case FINGERPRINT_IMAGEMESS:
      Serial.println("Image too messy");
      return 0; // No match
    case FINGERPRINT_PACKETRECIEVEERR:
      Serial.println("Communication error");
      return -1;
    case FINGERPRINT_FEATUREFAIL:
      Serial.println("Could not find fingerprint features");
      return -1;
    case FINGERPRINT_INVALIDIMAGE:
      Serial.println("Could not find fingerprint features");
      return -1;
    default:
      Serial.println("Unknown error");
      return -1;
  }

  p = finger.fingerSearch();
  if (p == FINGERPRINT_OK) {
    Serial.println("Found a print match!");
    if (finger.fingerID == id) {
      Serial.print("Matched ID #"); Serial.println(id);
      return 1; // Matched
    } else {
      Serial.print("Mismatched ID. Expected ID #"); Serial.println(id);
      return 0; // No match
    }
  } else if (p == FINGERPRINT_PACKETRECIEVEERR) {
    Serial.println("Communication error");
    return -1;
  } else if (p == FINGERPRINT_NOTFOUND) {
    Serial.println("Did not find a match");
    return 0; // No match
  } else {
    Serial.println("Unknown error");
    return -1;
  }
}
