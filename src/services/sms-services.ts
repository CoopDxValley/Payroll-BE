import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import config from "../config/config";
import logger from "../config/logger";

interface SmsError extends Error {
  code?: string;
}

async function sendSMS(phoneNumber: string, message: string): Promise<void> {
  try {
    const payload = {
      SMSGateway_Request: {
        ESBHeader: {
          serviceCode: "330000",
          channel: "USSD",
          Service_name: "SMSGateway",
          Message_Id: uuidv4(),
        },
        SMSGateway: {
          Mobile: phoneNumber,
          Text: message,
        },
      },
    };
    const result = await axios.post(config.smsAPIURL, payload);
    logger.info("SMS sent successfully", result.data);
  } catch (error: any) {
    const smsError: SmsError = new Error(
      `Failed to send SMS: ${error.message}`
    );
    smsError.code = error.code || "SMS_PROVIDER_ERROR";
    logger.error("error sending sms", smsError);
    throw smsError;
  }
}

export { sendSMS };
