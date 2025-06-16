import { Request, Response, NextFunction } from 'express';
import xlsx from 'xlsx';
import path from 'path';
import { validateParticipants } from '../validations/campaignparticipantvalidation';
import ApiError from '../utils/api-error';
interface Participant {
  fullName: string;
  gender: 'MALE' | 'FEMALE';
  address: string;
  phoneNumber: string;
  accountNumber: number;
  paymentMethod: 'PHONENUMBER' | 'ACCOUNTNUMBER';
  numberOfDaysInUrban: number;
  numberOfDaysInRural: number;
  detail: string;
}

const parseAndValidateExcel = (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    if (!file) {
      return next(new ApiError(400, 'No file uploaded.'));
    }

    const filePath = file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { defval: '' }); // empty cells become ''

    req.body.participants = data;
    req.body.filePath = filePath;

    validateParticipants(data as Participant[], filePath);

    next();
  } catch (error) {
    next(error);
  }
};
export default parseAndValidateExcel;