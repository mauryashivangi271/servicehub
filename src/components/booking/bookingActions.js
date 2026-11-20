import {
  getDisplayStatus
} from "../../services/bookingService";

export function getWorkerActions(
  booking,
  changeStatus,
  isBusiness = false
) {
  const status = getDisplayStatus(booking);

  const actions = {
    pending: [
      {
        label: "Accept Request",
        status: "accepted",
      },
      {
        label: "Decline Request",
        status: "cancelled",
        danger: true,
      },
    ],

    accepted: [
      ...(!isBusiness
        ? [
            {
              label: "On the Way",
              status: "on_the_way",
            },
          ]
        : []),
      {
        label: "Cancel Booking",
        status: "cancelled",
        danger: true,
      },
    ],

    assigned: [
      {
        label: "On the Way",
        status: "on_the_way",
      },
      {
        label: "Cancel Booking",
        status: "cancelled",
        danger: true,
      },
    ],

    on_the_way: [
      {
        label: "Mark Arrived",
        status: "arrived",
      },
    ],

    arrived: [
      {
        label: "Start Inspection",
        status: "inspection",
      },
      {
        label: "Start Work",
        status: "in_progress",
      },
    ],

    inspection: [
      {
        label: "Start Work",
        status: "in_progress",
      },
    ],

    in_progress: [
      {
        label: "Complete Service",
        status: "completed",
      },
    ],

    completed: [],
    cancelled: [],
    rejected: [],
  };

  return (actions[status] || []).map(action => ({
    label: action.label,
    danger: action.danger || false,
    onClick: item =>
      changeStatus(item, action.status),
  }));
}