
const createToggleObservable = (initialValue) => {
  return createToggle(new Rx.Subject(), initialValue, null);
}

const createToggle = (subject, initialValue, override) => { 
  const isVisibleWithOverride = () => {
    return Rx.Observable.merge(childStream(), parentStream())
  }
  
  const childStream = () => {
    return subject
        .withLatestFrom(override.isVisible())
        .map(([child, parent]) => { return child && !parent })
  }
  
  const parentStream = () => {
    return override.subject
            .withLatestFrom(subject)
            .map(([parent, child]) => { return child && !parent })
  }

  return {
    override: (parent) => {
      return new createToggle(subject, initialValue, parent);
    }, 
    subject: subject,
    toggle: () => {
      subject.next(!initialValue)
      return new createToggle(subject, !initialValue, override);
    },
    isVisible: () => {
      return override ? isVisibleWithOverride() : subject
    }
  }
}

const grandparent = createToggleObservable(true)
const parent = createToggleObservable(true).override(grandparent)
const child = createToggleObservable(true).override(parent);
grandparent.isVisible().subscribe(x => console.log("GRANDPARENT VISIBLE: ", x))
parent.isVisible().subscribe(x => console.log("PARENT VISIBLE: ", x))
child.isVisible().subscribe(x => console.log("CHILD VISIBLE: ", x))
const grandparentOff = grandparent.toggle()
const parentOff = parent.toggle()
console.log("child sequence")
const childOff = child.toggle().toggle().toggle()
console.log("parent once")
parentOff.toggle()
console.log("grandparent once")
grandparentOff.toggle()
console.log("final toggle")
childOff.toggle() //visible because parent hidden but should be hidden too because grandparent is visible

