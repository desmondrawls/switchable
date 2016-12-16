
createToggleObservable = initialValue => {
  return createToggle(new Rx.Subject(), initialValue, createFalseObservable());
}



createToggle = (subject, initialValue, override) => {
  return {
    toggle: () => {
      setTimeout(() => subject.next(!initialValue), 5000)
    },
    subscribe: (callback) => {
      override.subscribe(x => console.log("waiting for..."))
      subject
        .withLatestFrom(override)
        .map(([current, override]) => {
        return !current && !override
      })
        .subscribe(callback)
    }
  }
}

// createIntervalObservable().subscribe(x => console.log(x))

const toggle = createToggleObservable(true);
toggle.subscribe(x => console.log(x))
toggle.toggle()

function createFalseObservable(){
  return new Rx.Observable.interval(1000).map(x => false)
}
function createTrueObservable(){
  return new Rx.Observable.interval(1000).map(x => true)
}
