import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { StrictMode, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { action, computed, state } from "@loom-mvvm/core";
import {
  RuntimeProvider,
  useDecompose,
  useExternalSource,
  useViewModel,
  view,
} from "../src/index.js";

describe("useExternalSource", () => {
  it("renders initial value and updates", async () => {
    const counter = state(0);
    function Demo() {
      const value = useExternalSource(counter);
      return <span data-testid="value">{value}</span>;
    }
    render(<Demo />);
    expect(screen.getByTestId("value")).toHaveTextContent("0");
    act(() => {
      counter.set(2);
    });
    await waitFor(() => expect(screen.getByTestId("value")).toHaveTextContent("2"));
  });

  it("does not update for equal values", () => {
    const counter = state(1);
    const renders = vi.fn();
    function Demo() {
      renders();
      const value = useExternalSource(counter);
      return <span>{value}</span>;
    }
    render(<Demo />);
    const before = renders.mock.calls.length;
    act(() => {
      counter.set(1);
    });
    expect(renders.mock.calls.length).toBe(before);
  });

  it("accepts getServerSnapshot for SSR contract", () => {
    const counter = state(5);
    function Demo() {
      const value = useExternalSource(counter, () => 0);
      return <span data-testid="client-value">{value}</span>;
    }
    render(<Demo />);
    expect(screen.getByTestId("client-value")).toHaveTextContent("5");
  });

  it("keeps updating when the parent re-renders", async () => {
    const counter = state(0);
    function Child() {
      const value = useExternalSource(counter);
      return <span data-testid="value">{value}</span>;
    }
    function Parent() {
      const [, setTick] = useState(0);
      return (
        <>
          <button
            type="button"
            onClick={() => {
              setTick((tick) => tick + 1);
            }}
          >
            parent tick
          </button>
          <Child />
        </>
      );
    }
    render(<Parent />);
    act(() => {
      screen.getByRole("button", { name: "parent tick" }).click();
      screen.getByRole("button", { name: "parent tick" }).click();
    });
    act(() => {
      counter.set(3);
    });
    await waitFor(() => expect(screen.getByTestId("value")).toHaveTextContent("3"));
  });
});

describe("useDecompose", () => {
  it("re-renders once when multiple subscribed sources update together", () => {
    const count = state(0);
    const doubled = computed(() => count.get() * 2);
    const renders = vi.fn();
    function Demo() {
      renders();
      useDecompose({ count, doubled }, ["count", "doubled"] as const);
      return null;
    }
    render(<Demo />);
    const before = renders.mock.calls.length;
    act(() => {
      count.set(1);
    });
    expect(renders.mock.calls.length).toBe(before + 1);
  });
});

describe("useViewModel", () => {
  it("disposes view model on unmount", async () => {
    const dispose = vi.fn();
    function createVm() {
      return { dispose, value: 1 };
    }
    function Demo() {
      useViewModel(createVm);
      return null;
    }
    const { unmount } = render(<Demo />);
    unmount();
    await waitFor(() => {
      expect(dispose).toHaveBeenCalledTimes(1);
    });
  });
});

describe("StrictMode", () => {
  it("does not leak subscriptions", () => {
    const counter = state(0);
    function Demo() {
      useExternalSource(counter);
      return null;
    }
    render(
      <StrictMode>
        <Demo />
      </StrictMode>,
    );
    act(() => {
      counter.set(1);
    });
  });
});

describe("view", () => {
  it("renders view model actions", async () => {
    const Counter = view(
      () => {
        const count = state(0);
        return {
          count,
          increment: () => {
            count.set(count.get() + 1);
          },
          dispose: () => {
            count.dispose();
          },
        };
      },
      ({ vm }) => {
        const value = useExternalSource(vm.count);
        return (
          <button type="button" onClick={vm.increment}>
            {value}
          </button>
        );
      },
    );
    render(
      <RuntimeProvider>
        <Counter />
      </RuntimeProvider>,
    );
    expect(screen.getByRole("button")).toHaveTextContent("0");
    act(() => {
      screen.getByRole("button").click();
    });
    await waitFor(() => expect(screen.getByRole("button")).toHaveTextContent("1"));
  });

  it("updates with core action() batching like the demo", async () => {
    const Counter = view(
      () => {
        const count = state(0);
        return {
          count,
          increment: action(() => {
            count.set(count.get() + 1);
          }),
          dispose: () => {
            count.dispose();
          },
        };
      },
      ({ vm }) => {
        const value = useExternalSource(vm.count);
        return (
          <button type="button" onClick={vm.increment}>
            {value}
          </button>
        );
      },
    );
    render(
      <StrictMode>
        <RuntimeProvider>
          <Counter />
        </RuntimeProvider>
      </StrictMode>,
    );
    act(() => {
      fireEvent.click(screen.getByRole("button"));
    });
    await waitFor(() => expect(screen.getByRole("button")).toHaveTextContent("1"));
  });

  it("supports controlled inputs like change-password demo", async () => {
    const PasswordForm = view(
      () => {
        const password = state("");
        return {
          password,
          dispose: () => {
            password.dispose();
          },
        };
      },
      ({ vm }) => {
        const password = useExternalSource(vm.password);
        return (
          <input
            aria-label="Password"
            value={password}
            onChange={(event) => {
              vm.password.set(event.target.value);
            }}
          />
        );
      },
    );
    render(
      <StrictMode>
        <RuntimeProvider>
          <PasswordForm />
        </RuntimeProvider>
      </StrictMode>,
    );
    const input = screen.getByLabelText("Password");
    act(() => {
      fireEvent.change(input, { target: { value: "hello" } });
    });
    await waitFor(() => expect(input).toHaveValue("hello"));
  });
});
