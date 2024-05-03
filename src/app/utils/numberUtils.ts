export function convertNullOrEmptyToZero<T extends Record<string, any>>(
  data: T,
  fieldsToProcess: Array<keyof T>
): T {
  const processedData = { ...data };
  fieldsToProcess.forEach((field) => {
    if (processedData[field] === null || processedData[field] === "") {
      processedData[field] = 0 as unknown as T[keyof T];
    }
  });
  return processedData;
}
export function convertEmptyStringToNullForIDs<T extends Record<string, any>>(
  data: T,
  fieldsToProcess: Array<keyof T>
): T {
  const processedData = { ...data };
  fieldsToProcess.forEach((field) => {
    if (processedData[field] === "" || processedData[field] === null) {
      processedData[field] = null as unknown as T[keyof T];
    }
  });
  return processedData;
}

export function formatNumberIST(value: number | undefined): string | null {
  // Check if the value is zero (considering float comparison)
  if (value === 0 || value == undefined) {
    return null;
  }

  // Create an instance of Intl.NumberFormat for Indian English with options for minimum and maximum fraction digits set to 2
  const formatter = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(value);
}
