"use client";

import { StudyGroupResponse } from "../../lib/api/types";
import { Button } from "../ui";
import { Users, Lock, Globe, Clock } from "lucide-react";
import Image from "next/image";

interface GroupCardProps {
  group: StudyGroupResponse;
  onJoin: (groupId: number) => void;
  onRequestJoin: (groupId: number) => void;
  onViewDetails: (groupId: number) => void;
  isJoining?: boolean;
}

// Subject color mapping for visual variety
const subjectColors: Record<
  string,
  { bg: string; text: string; badge: string }
> = {
  "Computer Science": {
    bg: "bg-blue-500",
    text: "text-blue-700",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  Mathematics: {
    bg: "bg-purple-500",
    text: "text-purple-700",
    badge:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  },
  Physics: {
    bg: "bg-indigo-500",
    text: "text-indigo-700",
    badge:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  },
  Medicine: {
    bg: "bg-red-500",
    text: "text-red-700",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
  Languages: {
    bg: "bg-green-500",
    text: "text-green-700",
    badge:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  },
  Business: {
    bg: "bg-amber-500",
    text: "text-amber-700",
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  },
  History: {
    bg: "bg-orange-500",
    text: "text-orange-700",
    badge:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  },
  default: {
    bg: "bg-slate-500",
    text: "text-slate-700",
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
  },
};

function getSubjectColor(subjectName?: string) {
  if (!subjectName) return subjectColors.default;
  return subjectColors[subjectName] || subjectColors.default;
}

export function GroupCard({
  group,
  onJoin,
  onRequestJoin,
  onViewDetails,
  isJoining,
}: GroupCardProps) {
  const {
    id,
    name,
    description,
    subjectName,
    currentMemberCount,
    maxMembers,
    isPublic,
    coverImageUrl,
    isMember,
    hasPendingRequest,
  } = group;
    console.log(group.coverImageUrl);

  const subjectColor = getSubjectColor(subjectName);
  const isFull = currentMemberCount >= maxMembers;
  const handleAction = () => {
    if (isMember) {
      onViewDetails(id);
    } else if (isPublic) {
      onJoin(id);
    } else {
      onRequestJoin(id);
    }
  };

  // Generate tags from description (simple extraction of hashtags or keywords)
  const generateTags = (desc?: string): string[] => {
    if (!desc) return [];
    const hashtagMatches = desc.match(/#\w+/g);
    if (hashtagMatches) {
      return hashtagMatches.slice(0, 4).map((tag) => tag.substring(1));
    }
    // Fallback: extract key words
    const words = desc
      .split(" ")
      .filter((w) => w.length > 5)
      .slice(0, 3);
    return words.map((w) => w.replace(/[^a-zA-Z]/g, ""));
  };

  const tags = generateTags(description);

  return (
    <div
      className="group w-full relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600 cursor-pointer"
      onClick={() => onViewDetails(id)}
    >
      {/* Cover Image */}
      <div className={`relative h-36   ${!group.coverImageUrl ? subjectColor.bg : ""}`}>
            {group.coverImageUrl ? (
                <Image src={group.coverImageUrl} alt={name} fill
                       className="object-cover"
                 />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/30" />
            )}

        {/* Public/Private Badge */}
        <div
          className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
            isPublic
              ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
              : "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
          }`}
        >
          {isPublic ? (
            <>
              <Globe className="h-3 w-3" />
              Public
            </>
          ) : (
            <>
              <Lock className="h-3 w-3" />
              Private
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Subject Badge */}
        {subjectName && (
          <span
            className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium mb-2 ${subjectColor.badge}`}
          >
            {subjectName}
          </span>
        )}

        {/* Group Name */}
        <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {name}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
            {description.replace(/#\w+/g, "").trim()}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs text-slate-500 dark:text-slate-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
          {/* Member Count */}
          <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <Users className="h-4 w-4" />
            <span>{currentMemberCount} members</span>
          </div>

          {/* Action Button */}
          <Button
            variant={isMember ? "secondary" : "primary"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleAction();
            }}
            loading={isJoining}
            disabled={isFull && !isMember}
          >
            {isMember ? (
              "View Group"
            ) : hasPendingRequest ? (
              <>
                <Clock className="h-4 w-4 mr-1" />
                Pending
              </>
            ) : isFull ? (
              "Full"
            ) : (
              "Join Group"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton
export function GroupCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
      <div className="h-36 bg-slate-200 dark:bg-slate-700" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-20" />
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="flex gap-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
          <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded w-24" />
        </div>
      </div>
    </div>
  );
}
