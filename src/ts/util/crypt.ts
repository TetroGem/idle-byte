export function utf8ToBase64(str: string) {
    return btoa(encodeURIComponent(str));
}
  
export function base64ToUTF8(str: string) {
    return decodeURIComponent(atob(str));
}