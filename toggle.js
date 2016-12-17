
const createToggleObservable = (initialValue, override) => {
  return createToggle(new Rx.Subject(), initialValue, override);
}

const createToggle = (subject, initialValue, override) => { 
  const isVisibleWithOverride = () => {
    return Rx.Observable.merge(mainStream(), overrideStream())
  }
  
  const mainStream = () => {
    return subject
        .withLatestFrom(override.subject)
        .map(([current, other]) => { return current && !other })
  }
  
  const overrideStream = () => {
    return override.subject
            .withLatestFrom(subject)
            .map(([current, other]) => { return current && other })
  }

  return {
    subject: subject,
    toggle: () => {
      console.log("ABOUT TO TOGGLE FROM: ", initialValue, "TO: ", !initialValue)
      subject.next(!initialValue)
      return new createToggle(subject, !initialValue, override);
    },
    isVisible: () => {
      return override ? isVisibleWithOverride() : subject
    }
  }
}

const override = createToggleObservable(true, null)
override.isVisible().subscribe(x => console.log("OVERRIDE: ", x))
const toggle = createToggleObservable(true, override);
toggle.isVisible().subscribe(x => console.log("MAIN: ", x))
override.toggle()
console.log("toggle sequence")
toggle.toggle().toggle().toggle()
console.log("override")
override.toggle()
console.log("final toggle")
toggle.toggle()

function createFalseObservable(){
  return new Rx.Observable.interval(1000).map(x => false).take(10)
}
function createTrueObservable(){
  return new Rx.Observable.interval(1000).map(x => true).take(10)
}

