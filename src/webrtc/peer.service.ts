export const peerConnection =
  new RTCPeerConnection({
    iceServers: [
      {
        urls:
          'stun:stun.l.google.com:19302'
      }
    ]
  });

export const createOffer =
  async (
    stream:
      MediaStream
  ) => {
    stream
      .getTracks()
      .forEach(
        track => {
          peerConnection
            .addTrack(
              track,
              stream
            );
        }
      );

    const offer =
      await peerConnection
        .createOffer();

    await peerConnection
      .setLocalDescription(
        offer
      );

    return offer;
  };