import { Index, Show, createSignal, type Accessor } from "solid-js"
import { Plugin, usePlugin } from "@opencode/plugin/tui"
import {
  layoutBreakdown,
  layoutSection,
  type SectionLayout,
  type Stats,
} from "./layout.ts"
import { PANEL_NAME, createDisposables, panelCommand, registerSidebar } from "./setup.ts"

const EMPTY_STATS: Stats = {
  changes: [],
  statuses: [],
  completedTasks: 0,
  totalTasks: 0,
  specs: 0,
  requirements: 0,
  archived: 0,
}

function OpenspecLines(props: {
  readonly stats: Accessor<Stats | null>
  readonly error: Accessor<string | null>
  readonly layout: (stats: Stats) => SectionLayout
}) {
  const context = usePlugin()
  return (
    <Show
      when={props.stats()}
      fallback={<text fg={context.theme.text.muted}>{props.error() ?? "loading"}</text>}
    >
      {(stats: Accessor<Stats>) => {
        const view = () => props.layout(stats())
        return (
          <>
            <text fg={context.theme.text.base}>{view().total}</text>
            <Index each={view().body}>
              {(line) => <text fg={context.theme.text.muted}>{line()}</text>}
            </Index>
          </>
        )
      }}
    </Show>
  )
}

function OpenspecStats(props: {
  readonly stats: Accessor<Stats | null>
  readonly error: Accessor<string | null>
}) {
  const context = usePlugin()
  return (
    <box flexDirection="column" gap={0}>
      <text fg={context.theme.text.base}>OPENSPEC</text>
      <OpenspecLines stats={props.stats} error={props.error} layout={layoutSection} />
    </box>
  )
}

function OpenspecBreakdown(props: {
  readonly stats: Accessor<Stats | null>
  readonly error: Accessor<string | null>
}) {
  const context = usePlugin()
  return (
    <box flexDirection="column" gap={0}>
      <text fg={context.theme.text.base}>OPENSPEC</text>
      <OpenspecLines stats={props.stats} error={props.error} layout={layoutBreakdown} />
    </box>
  )
}

export default Plugin.define({
  id: "openspec.stats",
  setup(context) {
    const [stats] = createSignal<Stats | null>(EMPTY_STATS)
    const [error] = createSignal<string | null>(null)
    const bag = createDisposables()

    bag.add(
      registerSidebar(context, {
        append: "sidebar.content",
        render: () => <OpenspecStats stats={stats} error={error} />,
      }),
    )

    bag.add(
      registerSidebar(context, {
        append: "session.panel",
        render: (input) => (
          <Show when={input.name === PANEL_NAME}>
            <OpenspecBreakdown stats={stats} error={error} />
          </Show>
        ),
      }),
    )

    context.keymap.layer(() => ({
      commands: [panelCommand((name) => context.ui.panel.open(name))],
    }))

    return () => bag.dispose()
  },
})
