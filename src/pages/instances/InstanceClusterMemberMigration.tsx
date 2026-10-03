import type { FC } from "react";
import {
  ActionButton,
  Button,
  CheckboxInput,
} from "@canonical/react-components";
import type { LxdInstance } from "types/instance";
import ClusterMemberSelectTable from "../cluster/ClusterMemberSelectTable";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { isNearLiveMigration } from "util/nearLiveMigration";

interface Props {
  instance: LxdInstance;
  onSelect: (member: string) => void;
  targetMember: string;
  onCancel: () => void;
  migrate: () => void;
  nearLive: boolean;
  onNearLiveChange: (nearLive: boolean) => void;
}

const InstanceClusterMemberMigration: FC<Props> = ({
  instance,
  onSelect,
  targetMember,
  onCancel,
  migrate,
  nearLive,
  onNearLiveChange,
}) => {
  const { hasInstanceRefreshMigration } = useSupportedFeatures();
  const canNearLive = isNearLiveMigration(
    instance,
    hasInstanceRefreshMigration,
    targetMember,
  );

  const summary = (
    <div className="migrate-instance-summary">
      <p>
        This will migrate instance <strong>{instance.name}</strong> to cluster
        member <b>{targetMember}</b>.
      </p>
      {canNearLive && (
        <CheckboxInput
          id="near-live-migration"
          label="Use near-live migration (stop, move and restart the container)"
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
      {!targetMember && (
        <ClusterMemberSelectTable
          onSelect={onSelect}
          disableMember={{
            name: instance.location,
            reason: "Instance already on this member",
          }}
        />
      )}
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
          disabled={!targetMember}
        >
          Migrate
        </ActionButton>
      </footer>
    </>
  );
};

export default InstanceClusterMemberMigration;
