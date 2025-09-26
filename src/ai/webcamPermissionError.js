// Based on https://github.com/helenamerk/mic-check/blob/main/src/requestMediaPermissions.tsx.

const mediaPermissionsErrorMsg = {
	/** (macOS) browser does not have permission to access cam/mic */
	SystemPermissionDenied: 'Your browser cannot access your camera/microphone. Make sure permissions are enabled in your browser settings.',
	/** user denied permission for site to access cam/mic */
	UserPermissionDenied: 'There was an error accessing your camera/microphone. Make sure permissions are enabled.',
	/** (Windows) browser does not have permission to access cam/mic OR camera is in use by another application or browser tab */
	CouldNotStartVideoSource: 'Another application or browser tab may already be using your webcam. Please turn off other cameras before proceeding.',
	/** all other errors */
	Generic: 'There was an error accessing your camera/microphone. Make sure permissions are enabled, or ask for help.',
}

export const getMediaPermissionErrorMsg = (error) => {
  console.log(error.name, error.message)
  const errName = error.name
  const errMessage = error.message
  if (GLOBALS.browserUtils.isChrome) {
    if (errName === 'NotAllowedError' && errMessage === 'Permission denied by system') {
      return mediaPermissionsErrorMsg.SystemPermissionDenied;
    } 
    if (errName === 'NotAllowedError' && errMessage === 'Permission denied') {
      return mediaPermissionsErrorMsg.UserPermissionDenied;
    }
    if (errName === 'NotReadableError') {
      return mediaPermissionsErrorMsg.CouldNotStartVideoSource;
    }
  } 
  if (GLOBALS.browserUtils.isSafari && errName === 'NotAllowedError') {
    return mediaPermissionsErrorMsg.UserPermissionDenied;
  } 
  if (GLOBALS.browserUtils.isEdge) {
    if (errName === 'NotAllowedError') {
      return mediaPermissionsErrorMsg.UserPermissionDenied;
    } 
    if (errName === 'NotReadableError') {
      return mediaPermissionsErrorMsg.CouldNotStartVideoSource;
    }
  } 
  if (GLOBALS.browserUtils.isFirefox) {
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#exceptions
    if (errName === 'NotFoundError') {
      return mediaPermissionsErrorMsg.SystemPermissionDenied;
    } 
    if (errName === 'NotReadableError') {
      return mediaPermissionsErrorMsg.SystemPermissionDenied;
    } 
    if (errName === 'NotAllowedError') {
      return mediaPermissionsErrorMsg.UserPermissionDenied;
    }
    if (errName === 'AbortError') {
      return mediaPermissionsErrorMsg.CouldNotStartVideoSource;
    }
  }

  return mediaPermissionsErrorMsg.Generic;
}


import GLOBALS from '../config.js';