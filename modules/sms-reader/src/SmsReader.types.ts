export type SmsReaderMessage = {
  id: string;
  sender: string;
  body: string;
  /** Epoch milliseconds, as reported by the Android SMS provider. */
  receivedAt: number;
};

export type SmsReaderModuleEvents = {
  onMessageReceived: (message: SmsReaderMessage) => void;
};
