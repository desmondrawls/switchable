
const createToggleObservable = (initialValue, override) => {
  const toggleSubject = new Rx.Subject()
  return createToggle(toggleSubject, initialValue, override);
}
const createOverrideObservable = (initialValue, callback) => {
  const overrideSubject = new Rx.Subject()
  return createToggle(overrideSubject, initialValue, null);
}

const createToggle = (subject, initialValue, override) => { 
  const overriddenSubscribe = () => {
    return subject
        .withLatestFrom(override.subject)
        .do(([current, override]) => console.log("overridden gets current: ", current, "and ", override))
        .map(([current, override]) => { return !current && !override })
        .startWith("starting basic...")
  }

  const plainSubscribe = () => {
    return subject.startWith("starting override...")
  }

  return {
    subject: subject,
    toggle: () => {
      subject.next(!initialValue)
      return new createToggle(subject, !initialValue, override);
    },
    isVisible: () => {
      return override ? overriddenSubscribe() : plainSubscribe()
    }
  }
}

const override = createOverrideObservable(true)
override.isVisible().subscribe(x => console.log("OVERRIDE Junk: ", x))
const toggle = createToggleObservable(true, override);
toggle.isVisible().subscribe(x => console.log("TOGGLE: ", x))
override.toggle()
toggle.toggle().toggle().toggle()

function createFalseObservable(){
  return new Rx.Observable.interval(1000).map(x => false).take(10)
}
function createTrueObservable(){
  return new Rx.Observable.interval(1000).map(x => true).take(10)
}

