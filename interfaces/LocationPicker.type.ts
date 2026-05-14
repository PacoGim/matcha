export interface LocationPickerType {
    latitude: number;
    longitude: number;
    onLocationChange: (lat: number, lng: number) => void;
    allowEdit?: boolean;
}