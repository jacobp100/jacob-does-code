import { Video } from "../core/components";
import { className } from "../core/css";

type Props = {
  src: string;
  type: string;
};

const techniCalcVideoIsReleased = false;

export default ({ src, type }: Props) => (
  <>
    <button
      type="button"
      className={className("lightbox__button")}
      style={techniCalcVideoIsReleased ? undefined : { display: "none" }}
    >
      {"\u{25B6}"}&ensp;Play Video
    </button>
    <div className={className("lightbox__modal")} hidden>
      <button type="button" className={className("lightbox__close")}>
        <svg viewBox="0 0 60 60" width={60} height={60}>
          <path
            d="M12 12 L48 48 M48 12 L12 48"
            stroke="currentColor"
            strokeWidth={1}
            fill="none"
          />
        </svg>
      </button>
      <Video className="lightbox__video" src={src} type={type} controls />
    </div>
  </>
);
