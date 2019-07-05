import SoundRecording from './SoundRecording';

export default SoundRecording;

if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.component('vue-sound-recording', SoundRecording);
}
