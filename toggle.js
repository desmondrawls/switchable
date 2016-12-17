
const initiateToggle = (initialValue) => {
  return createToggle(new Rx.Subject(), initialValue, null);
}

const createToggle = (subject, initialValue, override) => { 
  const isVisibleWhenParentNot = () => {
    return Rx.Observable.merge(childStream(), parentStream())
  }
  
  const childStream = () => {
    return subject
        .withLatestFrom(override.isVisible())
        .map(([child, parent]) => { return child && !parent })
  }
  
  const parentStream = () => {
    return override.isVisible()
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
      return override ? isVisibleWhenParentNot() : subject
    }
  }
}

const grandparent = initiateToggle(true)
const parent = initiateToggle(true).override(grandparent)
const child = initiateToggle(true).override(parent);
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
childOff.toggle()

class childToggleSpy {
  visibility: boolean;
}

it('basic toggle', () => {
  let visibility = false;
  const toggle = initiateToggle(visibility);
  toggle.isVisible().subscribe((newVisibility) => visibility = newVisibility);
  
  toggle.toggle();
  
  expect(visibility).toBeTruthy();
})

it('double toggle', () => {
  let visibility = false;
  const toggle = initiateToggle(visibility);
  toggle.isVisible().subscribe((newVisibility) => visibility = newVisibility);
  
  toggle.toggle().toggle();
  
  expect(visibility).toBeFalsy();
})

it('parent toggle', () => {
  let childVisibility = false;
  const parent = initiateToggle(true)
  const offParent = parent.toggle()
  const child = initiateToggle(false).override(parent);
  toggle.isVisible().subscribe((newVisibility) => childVisibility = newVisibility);
  
  toggle.toggle()
  expect(childVisibility).toBeTruthy();
  
  offParent.toggle()
  
  expect(childVisibility).toBeFalsy();
})

it('grandparent toggle', () => {
  let childVisibility = false;
  const grandparent = initiateToggle(true)
  const offGrandparent = grandparent.toggle()
  const parent = initiateToggle(true).override(grandparent)
  const offParent = parent.toggle()
  const child = initiateToggle(false).override(parent);
  toggle.isVisible().subscribe((newVisibility) => childVisibility = newVisibility);
  
  toggle.toggle()
  expect(childVisibility).toBeTruthy();
  
  offParent.toggle()
  expect(childVisibility).toBeFalsy();
  
  offGrandparent.toggle()
  expect(childVisibility).toBeTruthy();
})
