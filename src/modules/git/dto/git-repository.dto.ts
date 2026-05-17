export interface GitRepositoryDto {
  id: string;
  name: string;
  fullName: string;
  owner: string;
  description: string;
  defaultBranch: string;
  private: boolean;
  cloneUrl: string;
  sshUrl: string;
  htmlUrl: string;
  language: string;
  updatedAt: Date;
  createdAt: Date;
}

export interface GitBranchDto {
  name: string;
  commitSha: string;
  protected: boolean;
}

export interface GitCommitDto {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: Date;
  };
  committer: {
    name: string;
    email: string;
    date: Date;
  };
  url: string;
}

export interface GitWebhookDto {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWebhookDto {
  url: string;
  events: string[];
  secret: string;
}
