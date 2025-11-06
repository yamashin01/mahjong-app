import Link from "next/link";
import type { EventRow } from "@/types";

type EventsSectionProps = {
  groupId: string;
  events: EventRow[];
  isAdmin: boolean;
};

export function EventsSection({ groupId, events, isAdmin }: EventsSectionProps) {
  const activeEvents = events.filter((e) => e.status === "active");
  const completedEvents = events.filter((e) => e.status === "completed");

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="items-center">
        <h2 className="text-2xl font-bold">イベント</h2>
      </div>

      {(activeEvents.length > 0 || completedEvents.length > 0) && (
        <div className="w-full items-center text-center">
          <Link
            href={`/groups/${groupId}/events/new`}
            className="block w-full rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200 transition-colors"
          >
            新規イベント作成
          </Link>
        </div>
      )}

      {/* 進行中のイベント */}
      {activeEvents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-green-700">進行中</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeEvents.map((event) => (
              <Link
                key={event.id}
                href={`/groups/${groupId}/events/${event.id}`}
                className="block rounded-lg border-2 border-green-500 bg-white p-4 hover:border-green-600 hover:shadow-md transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-gray-900">{event.name}</h4>
                    <span className="inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      進行中
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {new Date(event.event_date).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  {event.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">{event.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 完了済みのイベント */}
      {completedEvents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">完了済み</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completedEvents.map((event) => (
              <Link
                key={event.id}
                href={`/groups/${groupId}/events/${event.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 hover:shadow-md transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-gray-900">{event.name}</h4>
                    <span className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                      完了
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {new Date(event.event_date).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  {event.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">{event.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* イベントがない場合 */}
      {events.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="mx-auto max-w-md space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">イベントがありません</h3>
              <p className="text-sm text-gray-600 mt-2">
                大会や合宿などのイベントを作成して、対局記録をまとめましょう
              </p>
            </div>
            <Link
              href={`/groups/${groupId}/events/new`}
              className="inline-block rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700 transition-colors"
            >
              最初のイベントを作成
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
