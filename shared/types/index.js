"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchStatus = exports.SwipeDirection = exports.JobType = exports.UserType = void 0;
var UserType;
(function (UserType) {
    UserType["JOB_SEEKER"] = "job_seeker";
    UserType["EMPLOYER"] = "employer";
})(UserType || (exports.UserType = UserType = {}));
var JobType;
(function (JobType) {
    JobType["PART_TIME"] = "part_time";
    JobType["FREELANCE"] = "freelance";
    JobType["TEMPORARY"] = "temporary";
    JobType["CONTRACT"] = "contract";
})(JobType || (exports.JobType = JobType = {}));
var SwipeDirection;
(function (SwipeDirection) {
    SwipeDirection["LEFT"] = "left";
    SwipeDirection["RIGHT"] = "right";
    SwipeDirection["UP"] = "up";
})(SwipeDirection || (exports.SwipeDirection = SwipeDirection = {}));
var MatchStatus;
(function (MatchStatus) {
    MatchStatus["PENDING"] = "pending";
    MatchStatus["MATCHED"] = "matched";
    MatchStatus["UNMATCHED"] = "unmatched";
})(MatchStatus || (exports.MatchStatus = MatchStatus = {}));
//# sourceMappingURL=index.js.map