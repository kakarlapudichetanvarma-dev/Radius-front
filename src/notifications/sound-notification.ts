export const playNotificationSound =
  () => {

    const audio =
      new Audio(
        '/sounds/message.mp3'
      );

    audio.play();

  };