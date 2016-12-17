
const createToggleObservable = (initialValue, override) => {
  const toggleSubject = new Rx.Subject()
  return createToggle(toggleSubject, initialValue, override);
}
const createOverrideObservable = (initialValue, callback) => {
  const overrideSubject = new Rx.Subject()
  return createToggle(overrideSubject, initialValue, null);
}

const createToggle = (subject, initialValue, override) => { 
  const isVisibleWithOverride = () => {
    return Rx.Observable.merge(mainStream(), overrideStream())
  }
  
  const mainStream = () => {
    return subject
        .withLatestFrom(override.subject)
        .do(([current, other]) => console.log("overridden gets current: ", current, "and ", other))
        .map(([current, other]) => { return !current && !other })
        .startWith("starting basic...")
  }
  
  const overrideStream = () => {
    return override.subject
            .withLatestFrom(subject)
            .do(([current, other]) => console.log("overridde gets override: ", current, "and ", other))
            .map(([current, other]) => { return current && other })
            .startWith("starting basic...")
  }

  const isVisible = () => {
    return subject.startWith("starting override...")
  }

  return {
    subject: subject,
    toggle: () => {
      subject.next(!initialValue)
      return new createToggle(subject, !initialValue, override);
    },
    isVisible: () => {
      return override ? isVisibleWithOverride() : isVisible()
    }
  }
}

const override = createOverrideObservable(true)
override.isVisible().subscribe(x => console.log("OVERRIDE Junk: ", x))
const toggle = createToggleObservable(true, override);
toggle.isVisible().subscribe(x => console.log("TOGGLE: ", x))
override.toggle()
toggle.toggle().toggle()
override.toggle()

function createFalseObservable(){
  return new Rx.Observable.interval(1000).map(x => false).take(10)
}
function createTrueObservable(){
  return new Rx.Observable.interval(1000).map(x => true).take(10)
}


