
const createToggleObservable = (initialValue) => {
  return createToggle(new Rx.Subject(), initialValue, null);
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
    override: (parent) => {
      return new createToggle(subject, initialValue, parent);
    }, 
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

const override = createToggleObservable(true)
override.isVisible().subscribe(x => console.log("OVERRIDE: ", x))
const toggle = createToggleObservable(true).override(override);
toggle.isVisible().subscribe(x => console.log("MAIN: ", x))
override.toggle()
console.log("toggle sequence")
toggle.toggle().toggle().toggle()
console.log("override")
override.toggle()
console.log("final toggle")
toggle.toggle()

