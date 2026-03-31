import { Link } from "react-router-dom";
import Badge from "../ui/Badge";

const PSWCard = ({ profile }) => {
  const profileId = profile?._id;
  const name = profile?.userId?.name || "Provider";
  const services = profile?.services || [];

  return (
    <article className="rounded-2xl border border-brand-100/60 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-bold text-slate-900">{name}</p>
          <p className="text-sm text-slate-500">
            {profile?.location || "Location not set"}
          </p>
        </div>
        <Badge variant="success">
          {profile?.averageRating
            ? `${Number(profile.averageRating).toFixed(1)} / 5`
            : "New"}
        </Badge>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {services.slice(0, 3).map((service) => (
          <span
            className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700"
            key={service}
          >
            {service}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">
          ${profile?.hourlyRate}/hr
        </p>
        <Link
          className="btn-primary btn-sm"
          to={`/client/psw-profiles/${profileId}`}
        >
          View profile
        </Link>
      </div>
    </article>
  );
};

export default PSWCard;
