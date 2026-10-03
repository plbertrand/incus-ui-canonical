import type { FC } from "react";
import {
  ActionButton,
  Button,
  CheckboxInput,
} from "@canonical/react-components";
import type { LxdInstance } from "types/instance";
import ClusterMemberSelectTable from "../cluster/ClusterMemberSelectTable";
import { pluralize } from "util/helpers";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { isNearLiveMigration } from "util/nearLiveMigration";

interface Props {
  instances: LxdInstance[];
  onSelect: (member: string) => void;
  targetMember: string;
  getMigratableInstances: (
    targetMember: string,
    targetPool: string,
    targetProject: string,
  ) => LxdInstance[];
  onCancel: () => void;
  migrate: () => void;
  nearLive: boolean;
  onNearLiveChange: (nearLive: boolean) => void;
}

const InstanceBulkClusterMemberMigration: FC<Props> = ({
  instances,
  onSelect,
  targetMember,
  getMigratableInstances,
  onCancel,
  migrate,
  nearLive,
  onNearLiveChange,
}) => {
  const { hasInstanceRefreshMigration } = useSupportedFeatures();
  const migratableInstances = getMigratableInstances(targetMember, "", "");
  const migratableCount = migratableInstances.length;
  const skippedCount = instances.length - migratableCount;
  const canNearLive = migratableInstances.some((instance) =>
    isNearLiveMigration(instance, hasInstanceRefreshMigration, targetMember),
  );

  const summary = (
    <div className="migrate-instance-summary">
      <p>
        This will migrate <strong>{migratableCount}</strong>{" "}
        {pluralize("instance", migratableCount)} to cluster member{" "}
        <b>{targetMember}</b>.
        {skippedCount > 0 && (
          <>
            {" "}
            <strong>{skippedCount}</strong>{" "}
            {pluralize("instance", skippedCount)} already on this member will be
            skipped.
          </>
        )}
      </p>
      {canNearLive && (
        <CheckboxInput
          id="near-live-migration"
          label="Use near-live migration for running containers (stop, move and restart them)"
          checked={nearLive}
          onChange={() => {
            onNearLiveChange(!nearLive);
          }}
        />
      )}
    </div>
  );

  return (
    <>
      {targetMember && summary}
      {!targetMember && <ClusterMemberSelectTable onSelect={onSelect} />}
      <footer id="migrate-instance-actions" className="p-modal__footer">
        <Button
          className="u-no-margin--bottom"
          type="button"
          aria-label="cancel migrate"
          appearance="base"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <ActionButton
          appearance="positive"
          className="u-no-margin--bottom"
          onClick={migrate}
          disabled={!targetMember || migratableCount === 0}
        >
          Migrate
        </ActionButton>
      </footer>
    </>
  );
};

export default InstanceBulkClusterMemberMigration;
