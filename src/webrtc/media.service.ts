export const getAudioStream =
  async () => {
    return navigator
      .mediaDevices
      .getUserMedia({
        audio:
          true
      });
  };