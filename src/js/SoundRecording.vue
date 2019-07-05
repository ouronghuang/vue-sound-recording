<template>
    <div class="vue-sound-recording-wrapper">
        <slot>
            <div>
                <button type="button"
                        class="btn btn-primary"
                        @mousedown.prevent="mouseStart"
                        @mouseup.prevent="mouseEnd">
                    {{ msg }}
                </button>
            </div>
            <div class="mt-3">
                <audio v-if="src"
                       :src="src"
                       :key="src"
                       controls="controls">
                </audio>
            </div>
        </slot>
        <input type="hidden" :name="name" :value="src">
    </div>
</template>

<script>
    import recording from './recorder.js';
    import _ from 'lodash';

    export default {
        props: {
            // 双向绑定值
            value: {
                type: String,
                default: '',
            },

            // 上传链接
            action: {
                type: String,
                required: true,
            },

            // 最大支持多少秒录音时长
            seconds: {
                type: Number,
                default: 60,
            },

            // 表单字段名
            name: String,
        },
        watch: {
            // 推送事件
            src(val) {
                this.$emit('input', val);
            },

            // 重新绑定音频路径
            value(val) {
                this.src = val;
            },
        },
        data() {
            return {
                // 音频路径
                src: this.value,

                // 按钮文字
                msg: `按住说话（${this.seconds}秒）`,

                // 秒数
                time: this.seconds,

                // 定时器
                interval: null,

                // 录音器
                recorder: null,

                // 语音开始时间
                startTime: '',

                // 语音结束
                endTime: '',
            }
        },
        methods: {
            // 清除定时器
            clearTimer() {
                if (this.interval) {
                    clearInterval(this.interval);

                    this.interval = null;

                    this.time = this.seconds;

                    this.msg = `按住说话（${this.time}秒）`;
                }
            },

            // 长按说话
            mouseStart() {
                this.clearTimer();

                this.startTime = new Date().getTime();

                recording.get((rec) => {
                    // 当首次按下时，要获取浏览器的麦克风权限，所以这时要做一个判断处理
                    if (rec) {
                        // 首次按下，只调用一次
                        if (this.flag) {
                            this.mouseEnd();

                            this.flag = false;
                        } else {
                            this.recorder = rec;

                            this.interval = setInterval(() => {
                                if (this.time <= 0) {
                                    this.recorder.stop();

                                    this.clearTimer();
                                } else {
                                    this.time--;

                                    this.msg = `正在录音（${this.time}秒）`;

                                    this.recorder.start();
                                }
                            }, 1000);
                        }
                    }
                });
            },

            // 松开时上传语音
            mouseEnd: _.debounce(function () {
                this.clearTimer();

                this.endTime = new Date().getTime();

                if (this.recorder) {
                    this.recorder.stop();

                    // 获取语音二进制文件
                    let bold = this.recorder.getBlob();

                    // 将获取的二进制对象转为二进制文件流
                    let file = new File([bold], 'test.mp3', {type: 'audio/mp3', lastModified: Date.now()});

                    let form = new FormData();

                    form.append('file', file, file.name);

                    axios.post(this.action, form).then(response => {
                        this.src = response.data.src;
                    }).catch(error => {
                        console.log(error);
                    });
                }
            }, 200),
        }
    }
</script>
