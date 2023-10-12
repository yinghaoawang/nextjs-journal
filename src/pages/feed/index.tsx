import dayjs from '~/utils/dayjs';
import Image from 'next/image';
import Layout from '~/components/layouts/layout';
import { LoadingPage } from '~/components/loading';
import { trpc } from '~/utils/trpc';
import Link from 'next/link';
import { FeedContent } from '~/server/trpc/routers/feed';

const FeedContent = ({ feedContents }: { feedContents: FeedContent[] }) => {
  return (
    <div className="flex flex-col gap-8">
      {feedContents != null && feedContents.length === 0 && (
        <span className="mt-[-1rem] italic">
          You aren&apos;t following anybody, visit the&nbsp;
          <Link className="text-blue-500" href={'/explore'}>
            explore page
          </Link>
          &nbsp;to discover users!
        </span>
      )}
      {feedContents.map(({ user, post }) => (
        <div key={post.id} className="rounded-lg border border-gray-300 p-4">
          <div className="mb-2 flex flex-col">
            <div className="mb-1 flex items-center gap-3">
              <Link href={`/user/${user.id}`}>
                <Image
                  className="rounded-full"
                  alt={`${user?.displayName ?? user.firstName}'s pfp`}
                  height={40}
                  width={40}
                  src={user.imageUrl}
                />
              </Link>
              <Link href={`/user/${user.id}`}>
                {user?.displayName
                  ? user.displayName
                  : `${user?.firstName} ${user?.lastName ?? ''}`}
              </Link>
            </div>
            <span className="text-sm text-gray-500">
              {post.createdAt.getTime() === post.updatedAt.getTime() ? (
                <span>Posted {dayjs(post.createdAt).fromNow()}</span>
              ) : (
                <span>Updated {dayjs(post.updatedAt).fromNow()}</span>
              )}
            </span>
          </div>
          <div className="max-h-[400px] overflow-auto">
            <div className="journal">
              <h2>{dayjs(post.createdAt).format('MMMM DD, YYYY')}</h2>
              <p>Dear Journal,</p>
              <p>{post.content}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function FeedPage() {
  const { data: feedContents, isLoading: isFeedLoading } =
    trpc.feed.getFeed.useQuery();

  if (isFeedLoading) {
    return <LoadingPage />;
  }

  if (feedContents == null) throw new Error('Feed is null');
  return (
    <Layout className="pb-10">
      <h2 className="mb-6 text-2xl font-bold">Your Feed</h2>
      <FeedContent feedContents={feedContents} />
    </Layout>
  );
}
