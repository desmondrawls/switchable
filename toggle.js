
const createToggleObservable = (initialValue, override, callback) => {
  const toggleSubject = new Rx.Subject()
  return createToggle(toggleSubject, initialValue, override, callback);
}
const createOverrideObservable = (initialValue, callback) => {
  const overrideSubject = new Rx.Subject()
  return createToggle(overrideSubject, initialValue, null, callback);
}

const createToggle = (subject, initialValue, override, callback) => { 
  const overriddenSubscribe = callback => {
    subject
        .withLatestFrom(override.subject)
        .do(([current, override]) => console.log("overridden gets current: ", current, "and ", override))
        .map(([current, override]) => { return !current && !override })
        .startWith("starting basic...")
        .subscribe(callback)
  }

  const plainSubscribe = () => {
    subject.startWith("starting override...").subscribe(callback)
  }
  
  return {
    subject: subject,
    toggle: () => {
      subject.next(!initialValue)
      const newbie = new createToggle(subject, !initialValue, override)
      newbie.subscribe()
      return newbie;
    },
    subscribe: () => {
      override ? overriddenSubscribe(callback) : plainSubscribe(callback)
    }
  }
}

const override = createOverrideObservable(true, x => console.log("OVERRIDE Junk: ", x))
override.subscribe()
const toggle = createToggleObservable(true, override, x => console.log("TOGGLE: ", x));
toggle.subscribe()
override.toggle()
toggle.toggle().toggle().toggle()

function createFalseObservable(){
  return new Rx.Observable.interval(1000).map(x => false).take(10)
}
function createTrueObservable(){
  return new Rx.Observable.interval(1000).map(x => true).take(10)
}

