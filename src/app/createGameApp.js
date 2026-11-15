/**
 * Application lifecycle coordinator.
 *
 * This module is deliberately small: it starts injected services in a known
 * order and stops them in reverse order. It does not own game rules, state,
 * persistence, DOM, canvas, or chapter content.
 *
 * @param {{ services?: import("../core/contracts").ApplicationService[] }} options
 */
export function createGameApp({ services = [] } = {}) {
  if (!Array.isArray(services)) {
    throw new TypeError("createGameApp: services must be an array.");
  }

  const names = new Set();
  for (const service of services) {
    if (!service || typeof service.name !== "string" || !service.name.trim()) {
      throw new TypeError("Every application service must have a non-empty name.");
    }
    if (names.has(service.name)) {
      throw new Error("Duplicate application service name: " + service.name);
    }
    if (typeof service.start !== "function" || typeof service.stop !== "function") {
      throw new TypeError('Application service "' + service.name + '" must provide start() and stop().');
    }
    names.add(service.name);
  }

  let status = "created";
  let startedServices = [];

  async function start() {
    if (status === "running") return;
    if (status !== "created") {
      throw new Error('Cannot start application while status is "' + status + '".');
    }

    status = "starting";
    try {
      for (const service of services) {
        await service.start();
        startedServices.push(service);
      }
      status = "running";
    } catch (startError) {
      const rollbackErrors = [];
      for (const service of startedServices.reverse()) {
        try {
          await service.stop();
        } catch (error) {
          rollbackErrors.push(error);
        }
      }
      startedServices = [];
      status = "failed";
      if (rollbackErrors.length > 0) {
        throw new AggregateError(
          [startError, ...rollbackErrors],
          "Application startup failed and one or more services could not be rolled back."
        );
      }
      throw startError;
    }
  }

  async function stop() {
    if (status === "stopped") return;
    if (status === "starting" || status === "stopping") {
      throw new Error('Cannot stop application while status is "' + status + '".');
    }

    status = "stopping";
    const stopErrors = [];
    for (const service of startedServices.reverse()) {
      try {
        await service.stop();
      } catch (error) {
        stopErrors.push(error);
      }
    }
    startedServices = [];
    status = "stopped";

    if (stopErrors.length > 0) {
      throw new AggregateError(stopErrors, "One or more application services failed to stop cleanly.");
    }
  }

  return Object.freeze({
    start,
    stop,
    get status() {
      return status;
    }
  });
}
