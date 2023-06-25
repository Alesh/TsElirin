import { FC } from 'react';
import { MdMicOff, MdMic, MdCastConnected, MdCast, MdVideocamOff, MdVideocam } from 'react-icons/md';

type SetBoolean = (value: ((prevState: boolean) => boolean) | boolean) => void;
const toggle = (setBoolean: SetBoolean) => () => setBoolean((prevState) => !prevState);

export const MicButton: FC<{ mute: boolean; setMute: SetBoolean }> = ({ mute, setMute }) => (
  <>{mute ? <MdMicOff onClick={toggle(setMute)} /> : <MdMic onClick={toggle(setMute)} />}</>
);

export const CamButton: FC<{ active: boolean; setActive: SetBoolean }> = ({ active, setActive }) => (
  <>{active ? <MdVideocam onClick={toggle(setActive)} /> : <MdVideocamOff onClick={toggle(setActive)} />}</>
);

export const CastButton: FC<{ active: boolean; setActive: SetBoolean }> = ({ active, setActive }) => (
  <>{active ? <MdCastConnected onClick={toggle(setActive)} /> : <MdCast onClick={toggle(setActive)} />}</>
);
