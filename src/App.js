import './App.css';
import {useState, useEffect} from 'react'
import {interval, fromEvent, NEVER, merge} from 'rxjs'
import {switchMap, mapTo, tap, startWith, scan, map} from 'rxjs/operators'

const waitHandler = () => {
    let toggle = true
    return function () {
        toggle = !toggle
        setTimeout(() => {
            toggle = true
        }, 299)
        return toggle
    }
}

function App() {

    const [hours, setHours] = useState('00');
    const [minutes, setMinutes] = useState('00');
    const [seconds, setSeconds] = useState('00');

    const clearTimer = () => {
        setSeconds('00')
        setMinutes('00')
        setHours('00')
    }

    useEffect(() => {

        const waitEvent = waitHandler()

        const start = fromEvent(document.getElementById('start'), 'click').pipe(mapTo({pause: false}))
        const stop = fromEvent(document.getElementById('stop'), 'click').pipe(mapTo({pause: true, value: 0}))
        const reset = fromEvent(document.getElementById('reset'), 'click').pipe(mapTo({value: 0, pause: false}),
            tap(clearTimer))
        const wait = fromEvent(document.getElementById('wait'), 'click').pipe(map(val => {
            const toggle = waitEvent()
            return toggle ? {pause: true} : {pause: false}
        }))

        const events$ = merge(
            start, stop, reset, wait
        )

        const stopWatch$ = events$.pipe(
            startWith(
                {
                    pause: true,
                    value: 0
                }),
            scan((acc, curr) => ({...acc, ...curr}), {}),
            switchMap(val => {
                    return val.pause ? NEVER : interval(1000).pipe(
                        tap(() => {
                            val.value += 1
                            val.value % 60 < 10 ? setSeconds('0' + val.value % 60) : setSeconds(val.value % 60)
                            val.value / 60 % 60 < 10 ? setMinutes('0' + Math.floor(val.value / 60 % 60)) : setMinutes(Math.floor(val.value / 60 % 60))
                            val.value / 60 / 60 % 24 < 10 ? setHours('0' + Math.floor(val.value / 60 / 60 % 24)) : Math.floor(val.value / 60 / 60 % 24)
                        })
                    )
                }
            )
        )

        const sub = stopWatch$.subscribe()
        return () => {
            sub.unsubscribe()
        }
    }, [])


    return (
        <div className={'container'}>
            <div className={'container_stopwatch'}>
                <ul className={'container_stopwatch-timer'}>
                    <li className={'container_stopwatch-timer-hours'}>{hours}:</li>
                    <li className={'container_stopwatch-timer-minutes'}>{minutes}:</li>
                    <li className={'container_stopwatch-timer-seconds'}>{seconds}</li>
                </ul>
                <ul className={'container_buttons'}>
                    <li id={'start'}>Start</li>
                    <li id={'stop'}>Stop</li>
                    <li id={'wait'}>Wait</li>
                    <li id={'reset'}>Reset</li>
                </ul>
            </div>
        </div>
    );
}

export default App;
