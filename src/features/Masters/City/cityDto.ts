interface CityDto {
  cityID: number;
  cityName: string;
  pincode: string;
  stateId?: number; // Include this if cities are associated with states
  // Add any additional fields that your application requires
}

export default CityDto;
