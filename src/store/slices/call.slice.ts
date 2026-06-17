import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type CallType = 'AUDIO' | 'VIDEO';
export type CallStatus =
  | 'IDLE'
  | 'CALLING'       // we are calling someone
  | 'INCOMING'      // someone is calling us
  | 'ACTIVE'        // call is connected
  | 'ENDED';

interface CallState {
  // Current call info
  status: CallStatus;
  callType: CallType | null;
  sessionId: string | null;
  chatId: string | null;

  // Who is on the other end
  callerId: string | null;
  callerUsername: string | null;
  calleeId: string | null;
  calleeUsername: string | null;

  // SDP offer received from the caller, needed by the callee to build an answer
  offerSdp: RTCSessionDescriptionInit | null;

  // Legacy — kept for IncomingCallModal compatibility
  incomingCaller: string | null;
  activeCall: boolean;
}

const initialState: CallState = {
  status: 'IDLE',
  callType: null,
  sessionId: null,
  chatId: null,
  callerId: null,
  callerUsername: null,
  calleeId: null,
  calleeUsername: null,
  offerSdp: null,
  incomingCaller: null,
  activeCall: false,
};

const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    // We are initiating a call
    startOutgoingCall: (
      state,
      action: PayloadAction<{
        chatId: string;
        calleeId: string;
        calleeUsername: string;
        callType: CallType;
      }>
    ) => {
      state.status = 'CALLING';
      state.chatId = action.payload.chatId;
      state.calleeId = action.payload.calleeId;
      state.calleeUsername = action.payload.calleeUsername;
      state.callType = action.payload.callType;
      state.sessionId = null;
      state.activeCall = false;
    },

    // Session ID received after initiate
    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload;
    },

    // Someone is calling us
    receiveIncomingCall: (
      state,
      action: PayloadAction<{
        sessionId: string;
        chatId: string;
        callerId: string;
        callerUsername: string;
        callType: CallType;
        offerSdp: RTCSessionDescriptionInit;
      }>
    ) => {
      state.status = 'INCOMING';
      state.sessionId = action.payload.sessionId;
      state.chatId = action.payload.chatId;
      state.callerId = action.payload.callerId;
      state.callerUsername = action.payload.callerUsername;
      state.callType = action.payload.callType;
      state.offerSdp = action.payload.offerSdp;
      state.incomingCaller = action.payload.callerUsername;
      state.activeCall = false;
    },

    // Call was answered — now active
    callAnswered: (state) => {
      state.status = 'ACTIVE';
      state.activeCall = true;
      state.incomingCaller = null;
    },

    // We accepted an incoming call
    acceptCall: (state) => {
      state.status = 'ACTIVE';
      state.activeCall = true;
      state.incomingCaller = null;
    },

    // We rejected an incoming call
    rejectCall: (state) => {
      return { ...initialState };
    },

    // Call ended by either side
    endCall: (state) => {
      return { ...initialState };
    },

    // Legacy
    receiveCall: (state, action: PayloadAction<string>) => {
      state.incomingCaller = action.payload;
    },
  },
});

export const {
  startOutgoingCall,
  setSessionId,
  receiveIncomingCall,
  callAnswered,
  acceptCall,
  rejectCall,
  endCall,
  receiveCall,
} = callSlice.actions;

export default callSlice.reducer;