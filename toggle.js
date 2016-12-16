
createToggleObservable = (initialValue, override) => {
  return createToggle(new Rx.Subject(), initialValue, override);
}
createOverrideObservable = initialValue => {
  return createToggle(new Rx.Subject(), initialValue, null);
}

createToggle = (subject, initialValue, override) => { 
  overriddenSubscribe = callback => {
    subject
        .withLatestFrom(override.subject)
        .do(([current, override]) => console.log("overridden gets first: ", current, "and ", override))
        .map(([current, override]) => { return !current && !override })
        .startWith("start overridden")
        .subscribe(callback)
  }

  plainSubscribe = callback => subject.startWith(initialValue).subscribe(callback)
  
  return {
    subject: subject,
    toggle: () => subject.next(!initialValue),
    subscribe: (callback) => {
      override ? overriddenSubscribe(callback) : plainSubscribe(callback)
    }
  }
}

const override = createOverrideObservable(false)
const toggle = createToggleObservable(false, override);
override.subscribe(x => console.log("OVERRIDE Junk: ", x))
toggle.subscribe(x => console.log("TOGGLE: ", x))
override.toggle()
toggle.toggle()

function createFalseObservable(){
  return new Rx.Observable.interval(1000).map(x => false).take(10)
}
function createTrueObservable(){
  return new Rx.Observable.interval(1000).map(x => true).take(10)
}


