
const createToggleObservable = (initialValue, override) => {
  const toggleSubject = new Rx.Subject()
  return createToggle(toggleSubject, initialValue, override);
}
const createOverrideObservable = initialValue => {
  const overrideSubject = new Rx.Subject()
  return createToggle(overrideSubject, initialValue, null);
}

const createToggle = (subject, initialValue, override) => { 
  const overriddenSubscribe = callback => {
    subject
        .withLatestFrom(override.subject)
        .do(([current, override]) => console.log("overridden gets first: ", current, "and ", override))
        .map(([current, override]) => { return !current && !override })
        .startWith("starting basic...")
        .subscribe(callback)
  }

  const plainSubscribe = callback => {
    subject.startWith("starting override...").subscribe(callback)
  }
  
  return {
    subject: subject,
    toggle: () => subject.next(!initialValue),
    subscribe: (callback) => {
      override ? overriddenSubscribe(callback) : plainSubscribe(callback)
    }
  }
}

const override = createOverrideObservable(true)
override.subscribe(x => console.log("OVERRIDE Junk: ", x))
const toggle = createToggleObservable(true, override);
toggle.subscribe(x => console.log("TOGGLE: ", x))
override.toggle()
toggle.toggle()

function createFalseObservable(){
  return new Rx.Observable.interval(1000).map(x => false).take(10)
}
function createTrueObservable(){
  return new Rx.Observable.interval(1000).map(x => true).take(10)
}

