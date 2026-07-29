import { action, computed, defineViewModel, state } from "@loom-mvvm/core";
import type { ReadableSourceKeys } from "@loom-mvvm/react";
import { RuntimeProvider, useDecompose, view } from "@loom-mvvm/react";
import { createDemoApi } from "../api/createDemoApi.js";

const api = createDemoApi({ latency: 400 });

function createChangePasswordViewModel() {
  const password = state("");
  const confirm = state("");
  const loading = state(false);
  const error = state<string | null>(null);
  const success = state(false);

  const isValid = computed(
    () => password.get().length >= 8 && password.get() === confirm.get(),
  );

  const submit = action(async () => {
    if (!isValid.get()) return;
    loading.set(true);
    error.set(null);
    success.set(false);
    try {
      await api.changePassword(password.get());
      success.set(true);
    } catch (err) {
      error.set(err instanceof Error ? err.message : "Unknown error");
    } finally {
      loading.set(false);
    }
  });

  return {
    password,
    confirm,
    loading,
    error,
    success,
    isValid,
    submit,
    dispose() {
      password.dispose();
      confirm.dispose();
      loading.dispose();
      error.dispose();
      success.dispose();
      isValid.dispose();
    },
  };
}

type ChangePasswordVm = ReturnType<typeof createChangePasswordViewModel>;

const ChangePasswordViewModel = defineViewModel(createChangePasswordViewModel);

const changePasswordFields = [
  "password",
  "confirm",
  "loading",
  "error",
  "success",
  "isValid",
] as const satisfies readonly ReadableSourceKeys<ChangePasswordVm>[];

const ChangePasswordView = view(ChangePasswordViewModel, ({ vm }) => {
  const { password, confirm, loading, error, success, isValid } = useDecompose(
    vm,
    changePasswordFields,
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void vm.submit();
      }}
    >
      <label>
        Password
        <input
          value={password}
          onChange={(event) => {
            vm.password.set(event.target.value);
          }}
        />
      </label>
      <label>
        Confirm
        <input
          value={confirm}
          onChange={(event) => {
            vm.confirm.set(event.target.value);
          }}
        />
      </label>
      <p>Valid: {String(isValid)} (min 8 characters, must match)</p>
      {loading ? <p>Loading…</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {success ? <p>Password updated</p> : null}
      <button type="submit" disabled={!isValid || loading}>
        Change password
      </button>
    </form>
  );
});

export function ChangePasswordDemo() {
  return (
    <RuntimeProvider>
      <ChangePasswordView />
    </RuntimeProvider>
  );
}
