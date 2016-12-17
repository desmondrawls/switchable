const initializeToggle = (initialValue) => {
  return createToggle(new Rx.Subject(), initialValue, []);
}

const createToggle = (subject, initialValue, parents) => { 
  const isVisibleWhenParentNot = () => {
    return Rx.Observable.merge(childStream(), ...parents.map((parent) => parentStream(parent)))
  }
  
  const childStream = () => {
    return subject
        .withLatestFrom(...parents.map((parent) => parent.isVisible()))
        .map(([child, ...parentVisibilities]) => { 
          return child && parentVisibilities.every((x) => x !== true);
        })
  }
  
  const parentStream = (parent) => {
    return parent.isVisible()
            .withLatestFrom(subject)
            .map(([parent, child]) => { return child && !parent })
  }

  return {
    respect: (parent) => {
      return new createToggle(subject, initialValue, parents.concat(parent));
    }, 
    subject: subject,
    toggle: () => {
      subject.next(!initialValue)
      return new createToggle(subject, !initialValue, parents);
    },
    isVisible: () => {
      return parents.length ? isVisibleWhenParentNot() : subject
    }
  }
}

const grandparent = initializeToggle(true)
const parent = initializeToggle(true).respect(grandparent)
const otherParent = initializeToggle(true)
const child = initializeToggle(true).respect(parent).respect(otherParent);
grandparent.isVisible().subscribe(x => console.log("GRANDPARENT VISIBLE: ", x))
parent.isVisible().subscribe(x => console.log("PARENT VISIBLE: ", x))
otherParent.isVisible().subscribe(x => console.log("OTHER PARENT VISIBLE: ", x))
child.isVisible().subscribe(x => console.log("CHILD VISIBLE: ", x))
const grandparentOff = grandparent.toggle()
const parentOff = parent.toggle()
const otherParentOff = otherParent.toggle()
console.log("child twice")
const childOff = child.toggle().toggle()
console.log("parent once")
parentOff.toggle()
console.log("grandparent once")
grandparentOff.toggle()
console.log("other parent twice")
otherParentOff.toggle().toggle()
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
  const parentOff = parent.toggle()
  const child = initiateToggle(false).respect(parent);
  toggle.isVisible().subscribe((newVisibility) => childVisibility = newVisibility);
  
  toggle.toggle()
  expect(childVisibility).toBeTruthy();
  
  parentOff.toggle()
  expect(childVisibility).toBeFalsy();
})

it('multiple parents', () => {
  let childVisibility = false;
  const parent = initiateToggle(false)
  const parentOn = parent.toggle()
  const otherParent = initiateToggle(false)
  const otherParentOn = otherParent.toggle()
  const child = initiateToggle(false).respect(parent).respect(otherParent);
  child.isVisible().subscribe((newVisibility) => childVisibility = newVisibility);
  
  child.toggle()
  expect(childVisibility).toBeFalsy();
  
  parentOn.toggle()
  expect(childVisibility).toBeFalsy();
  
  otherParentOn.toggle()
  expect(childVisibility).toBeTruthy()
})

it('grandparent toggle', () => {
  let childVisibility = false;
  const grandparent = initiateToggle(true)
  const grandparentOff = grandparent.toggle()
  const parent = initiateToggle(true).respect(grandparent)
  const parentOff = parent.toggle()
  const child = initiateToggle(false).respect(parent);
  toggle.isVisible().subscribe((newVisibility) => childVisibility = newVisibility);
  
  toggle.toggle()
  expect(childVisibility).toBeTruthy();
  
  parentOff.toggle()
  expect(childVisibility).toBeFalsy();
  
  grandparentOff.toggle()
  expect(childVisibility).toBeTruthy();
})
