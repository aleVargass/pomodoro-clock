import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const buttonPressed = { transform: "translateY(6px)", boxShadow: "none" },
      buttonUnpress = { transform: "translateY(0)", boxShadow: "#ebebeb 0 6px 0" },
      breakBackgroundColor = { backgroundColor: "#669bbc", transition: "background-color: .5s ease-in-out 0s"},
      sessionBackgroundColor = { backgroundColor: "#f15757", transition: "background-color .5s ease-in-out 0s"},
      breakColor = { color: "#6da9e9"},
      sessionColor = { color: "#f25757" } 

const accurrateInterval = function (fn, time) {
    var cancel, nextAt, timeout, wrapper;
    nextAt = new Date().getTime() + time;
    timeout = null;
    wrapper = function () {
        nextAt += time;
        timeout = setTimeout(wrapper, nextAt - new Date().getTime());
        return fn();
    }
    cancel = function () {
        return clearTimeout(timeout);
    };
    timeout = setTimeout(wrapper, nextAt - new Date().getTime());
    return {
        cancel: cancel
    };
};  

class Clock extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            break: 5,
            session: 25,
            timerState: "stopped",
            intervalID: "",
            timer: 1500,
            timerType: "Session",
            label: "START",
            buttonState: buttonUnpress,
            backgroundColor: sessionBackgroundColor,
            textColorButton: sessionColor
        }
        this.setBreakControl = this.setBreakControl.bind(this)
        this.setSessionControl = this.setSessionControl.bind(this)
        this.lengthControl = this.lengthControl.bind(this)
        this.reset = this.reset.bind(this);
        this.clockify = this.clockify.bind(this);
        this.timerControl = this.timerControl.bind(this);
        this.beginCountDown = this.beginCountDown.bind(this)
        this.decrementTimer = this.decrementTimer.bind(this)
        this.phaseControl = this.phaseControl.bind(this)
        this.switchTimer = this.switchTimer.bind(this)
        this.buzzer = this.buzzer.bind(this);
    }

    setSessionControl(e) {
        this.lengthControl(
            "session",
            e.currentTarget.value,
            this.state.session,
            "Break"
        )
    }
    setBreakControl(e) {
        this.lengthControl(
            "break",
            e.currentTarget.value,
            this.state.break,
            "Session"
        )
    }
    lengthControl(stateToChange, sign, currentLength, timerType) {
        if (this.state.timerState !== "running") {
            if (this.state.timerType === timerType) {
                if (sign === "-" && currentLength > 1) {
                    this.setState({ [stateToChange]: currentLength - 1});
                } else if (sign === "+" && currentLength < 60) {
                    this.setState({ [stateToChange]: currentLength + 1});
                }
            } else if (sign === "-" && currentLength > 1) {
                this.setState({
                    [stateToChange]: currentLength - 1,
                    timer: currentLength * 60 - 60
                })
            } else if (sign === "+" && currentLength < 60) {
                this.setState({
                    [stateToChange]: currentLength + 1,
                    timer: currentLength * 60 + 60
                })
            }
        }
    }
    reset() {
        this.setState({
            break: 5,
            session: 25,
            timerState: "stopped",
            timerType: "Session",
            timer: 1500,
            label: "START",
            intervalID: "",
            buttonState: buttonUnpress,
            backgroundColor: sessionBackgroundColor,
            textColorButton: sessionColor
        })
        if (this.state.intervalID) {
            this.state.intervalID.cancel()
        }
        this.audioBeep.pause();
        this.audioBeep.currentTime = 0;
    }
    clockify() {
        let minutes = Math.floor(this.state.timer / 60)
        let seconds = this.state.timer - minutes * 60
        seconds = seconds < 10 ? "0" + seconds : seconds;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        return minutes + ":" + seconds;
    }
    timerControl() {
        if (this.state.timerState === "stopped") {
            this.beginCountDown();
            this.setState({
                timerState: "running",
                label: "STOP", 
                buttonState: buttonPressed
            });
        } else {
            this.setState({
                timerState: "stopped",
                label: "START",
                buttonState: buttonUnpress
            });
            if (this.state.intervalID) {
                this.state.intervalID.cancel();
            }
        }
    }
    beginCountDown() {
        this.setState({
            intervalID: accurrateInterval(() => {
                this.decrementTimer();
                this.phaseControl();
            }, 1000)
        })
    }
    decrementTimer() {
        this.setState({timer: this.state.timer - 1})
    }
    phaseControl() {
        let timer = this.state.timer
        this.buzzer(timer)
        if (timer === 0) {
            if (this.state.intervalID) {
                this.state.intervalID.cancel()
            }
            if (this.state.timerType === "Session") {
                this.beginCountDown()
                this.switchTimer(this.state.break * 60, "Break", breakBackgroundColor, breakColor)
            } else {
                this.beginCountDown()
                this.switchTimer(this.state.session * 60, "Session", sessionBackgroundColor, sessionColor)
            }
        }
    }
    switchTimer(num, str, backgroundColor, textColor) {
        this.setState({
            timer: num,
            timerType: str,
            backgroundColor: backgroundColor,
            textColorButton: textColor
        })
    }
    buzzer(_timer) {
        if (_timer === 0) {
            this.audioBeep.play()
        }
    }
    render() {
        return (
            <div id="background" style={this.state.backgroundColor}>
                <div id="container">
                    <h1>25 + 5 Clock</h1>
                    <div id="controls-container">
                        <div id="break-control"> 
                            <div id="break-label">Break Length</div>
                            <div className="container-caret">
                                <button id="break-increment" className="button" onClick={this.setBreakControl} value="+">
                                    <img className="caret" height={22} src={"https://alevargass.github.io/hosted-assets/caret-up.svg"}></img>
                                </button>
                                <div id="break-length">{this.state.break}</div>
                                <button id="break-decrement" className="button" onClick={this.setBreakControl} value="-">
                                    <img className="caret-down" height={22} src={"https://alevargass.github.io/hosted-assets/caret-down.svg"}></img>
                                </button>
                            </div>
                        </div>
                        <div id="session-control">
                            <div id="session-label">Session Length</div>
                            <div className="container-caret">
                                <button id="session-increment" className="button" onClick={this.setSessionControl} value="+">
                                    <img className="caret" height={22} src={"https://alevargass.github.io/hosted-assets/caret-up.svg"}></img>
                                </button>
                                <div id="session-length">{this.state.session}</div>
                                <button id="session-decrement" className="button" onClick={this.setSessionControl} value="-">
                                    <img className="caret-down" height={22} src={"https://alevargass.github.io/hosted-assets/caret-down.svg"}></img>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div id="timer">
                        <div id="timer-label">{this.state.timerType}</div>
                        <div id="time-left">{this.clockify()}</div>
                    </div>
                    <div id="timercontrol-container">
                        <div id="container-start_stop">
                            <button 
                                id="start_stop" 
                                className="button"
                                onClick={this.timerControl}
                                style={this.state.buttonState}
                            >
                                <span style={this.state.textColorButton}>{this.state.label}</span>
                            </button>
                        </div>
                        <button 
                            id="reset"
                            className="button" 
                            onClick={this.reset}>
                            <img 
                                height={22} 
                                src={"https://alevargass.github.io/hosted-assets/rotate-left.svg"}
                            />
                        </button>
                        <audio 
                            id="beep"
                            preload="auto"
                            ref={(audio) => {                        
                                this.audioBeep = audio
                            }}
                            src={"https://alevargass.github.io/hosted-assets/alarm.mp3"}
                        />
                    </div>
                </div>
            </div>
        )
    }
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<Clock/>)