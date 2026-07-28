import { action, defineViewModel, state } from "@loom/core";
import { RuntimeProvider, useExternalSource, view } from "@loom/react";
import { Button, Text, View } from "react-native";

const CounterViewModel = defineViewModel(() => {
  const count = state(0);
  const increment = action(() => {
    count.set(count.get() + 1);
  });
  return {
    count,
    increment,
    dispose() {
      count.dispose();
    },
  };
});

const Counter = view(CounterViewModel, ({ vm }) => {
  const value = useExternalSource(vm.count);
  return (
    <View>
      <Text>Count: {value}</Text>
      <Button title="Increment" onPress={vm.increment} />
    </View>
  );
});

export function App() {
  return (
    <RuntimeProvider>
      <Counter />
    </RuntimeProvider>
  );
}
