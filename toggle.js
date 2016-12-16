
createToggleObservable = (initialValue, override) => {
  return createToggle(new Rx.Subject(), initialValue, override);
}
createOverrideObservable = initialValue => {
  return createOverride(new Rx.Subject(), initialValue);
}


createOverride = (subject, initialValue) => {
  return {
    subject: subject,
    toggle: () => subject.next(!initialValue),
    subscribe: (callback) => subject.startWith(initialValue).subscribe(callback)
  }
}


createToggle = (subject, initialValue, override) => {
  return {
    toggle: () => subject.next(!initialValue),
    subscribe: (callback) => {
      subject
        .startWith(initialValue)
        .withLatestFrom(override.subject)
        .map(([current, override]) => { return !current && !override })
        .subscribe(callback)
    }
  }
}

const override = createOverrideObservable(false)
const toggle = createToggleObservable(false, override);
toggle.subscribe(x => console.log("TOGGLE: ", x))
override.subscribe(x => console.log("OVERRIDE Junk: ", x))
override.toggle()
toggle.toggle()
override.toggle()
toggle.toggle()
toggle.toggle()

function createFalseObservable(){
  return new Rx.Observable.interval(1000).map(x => false).take(10)
}
function createTrueObservable(){
  return new Rx.Observable.interval(1000).map(x => true).take(10)
}

