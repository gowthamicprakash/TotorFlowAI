import React from 'react';
import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { Button, EmptyState } from './ui';

export default function NoBranchState() {
  return (
    <div className="mx-auto max-w-2xl py-10">
      <EmptyState
        icon={Building2}
        title="Create a branch to get started"
        description="Students, batches, attendance and fees are all scoped to a branch. Add your first campus to unlock the dashboard."
        action={
          <Link to="/branches">
            <Button icon={Building2}>Go to Branches</Button>
          </Link>
        }
      />
    </div>
  );
}
