teToggleObservable = initialValue => {
    return createToggle(new Rx.Subject(), initialValue);
}

function createIntervalObservable(){
    return new Rx.Observable.interval(1000)
}

createToggle = (subject, initialValue) => {
    return {
          toggle: () => subject.next(!initialValue),
              subscribe: (callback) => subject.subscribe(callback)
                }
}

// createIntervalObservable().subscribe(x => console.log(x))
//
// const toggle = createToggleObservable(true);
// toggle.subscribe(x => console.log(x))
// toggle.toggle()
